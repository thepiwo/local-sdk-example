const {Universal, Node, MemoryAccount, Crypto} = require('@aeternity/aepp-sdk')

const exampleSource = `
contract Example =
  entrypoint example(x : int) = x
`

const factorySource = `
contract Example =
  entrypoint example(x : int) = x

main contract Factory =
  stateful entrypoint create() =
    Chain.create() : Example
`

const main = async () => {
  //const keypair = Crypto.generateKeyPair()
  //console.log('keypair', keypair)
  const keypair = {
    publicKey: 'ak_4FJFaSFiTts7uStAWa7wXSHxXXrueH2f7XREykDCL21wDBxpM',
    secretKey: 'e8fc19fae94a754bcb9233b1d95d9740828a7af4ead066c3af01fcbb80202bb8075f20af877e2d8e915a4851d1791675a08e26bc91bbb88ea86eaa2384c84322'
  }

  const client = await Universal({
    compilerUrl: 'https://latest.compiler.aepps.com',
    nodes: [{
      name: 'node',
      instance: await Node({url: 'http://localhost:3013/'}),
    }],
    accounts: [
      MemoryAccount({keypair}),
    ],
  })

  const factoryContract = await client.getContractInstance(factorySource)
  await factoryContract.deploy()
  console.log('deployed factory')

  const exampleContractAddress = (await factoryContract.methods.create()).decodedResult
  console.log('created example', exampleContractAddress)

  const exampleContract = await client.getContractInstance(exampleSource, {contractAddress: exampleContractAddress})
  console.log('called example', (await exampleContract.methods.example(42)).decodedResult)
}

main()
