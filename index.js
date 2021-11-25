const {Universal, Node, MemoryAccount} = require('@aeternity/aepp-sdk')

const exampleSource = `
contract Example =
  datatype event = E_A(address, int)

  stateful entrypoint example(x : int) = 
    Chain.event(E_A(Call.caller, x))
    x
`

const remoteCallSource = `
contract interface Example =
  stateful entrypoint example : (int) => int 

main contract RemoteCall =
  datatype event = E_B(address, int)
  stateful entrypoint call_remote(example : Example, x : int) =
    Chain.event(E_B(Call.caller, x))
    example.example(x)
`

const main = async () => {
  const keypair = {
    publicKey: 'ak_4FJFaSFiTts7uStAWa7wXSHxXXrueH2f7XREykDCL21wDBxpM',
    secretKey: 'e8fc19fae94a754bcb9233b1d95d9740828a7af4ead066c3af01fcbb80202bb8075f20af877e2d8e915a4851d1791675a08e26bc91bbb88ea86eaa2384c84322'
  }

  const client = await Universal({
    compilerUrl: 'http://localhost:3080/',
    nodes: [{
      name: 'node',
      instance: await Node({url: 'http://localhost:3001/', ignoreVersion: true}),
    }],
    accounts: [
      MemoryAccount({keypair}),
    ],
  })

  const exampleContract = await client.getContractInstance({source: exampleSource})
  await exampleContract.deploy()
  console.log('deployed example', exampleContract.deployInfo.address)

  const remoteCallContract = await client.getContractInstance({source: remoteCallSource})
  await remoteCallContract.deploy()
  console.log('deployed remote caller')


  const callRemote = await remoteCallContract.methods.call_remote(exampleContract.deployInfo.address, 42)
  console.log('called remote events', callRemote.decodedEvents)
  console.log('remote events', exampleContract.decodeEvents(callRemote.result.log))
}

main()
