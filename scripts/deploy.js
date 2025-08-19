const fs = require('node:fs');
const path = require('node:path');
const hre = require('hardhat');

async function main() {
  const candidatesEnv = (process.env.CANDIDATES || 'Alice,Bob,Carol')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const Voting = await hre.ethers.getContractFactory('Voting');
  const voting = await Voting.deploy(candidatesEnv);
  await voting.waitForDeployment();
  const addr = await voting.getAddress();
  console.log('Voting deployed to:', addr);

  // Copy ABI to frontend and write address for convenience
  const artifactPath = path.join(
    __dirname,
    '..',
    'artifacts',
    'contracts',
    'Voting.sol',
    'Voting.json'
  );
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const abiOnly = artifact.abi;
    const feDir = path.join(__dirname, '..', 'frontend', 'src');
    fs.mkdirSync(path.join(feDir, 'abi'), { recursive: true });
    fs.writeFileSync(path.join(feDir, 'abi', 'Voting.json'), JSON.stringify(abiOnly, null, 2));
    const cfg = `export const CONTRACT_ADDRESS = '${addr}';\n`;
    fs.writeFileSync(path.join(feDir, 'config.js'), cfg);
    console.log('Wrote ABI and address into frontend/src/');
  } else {
    console.warn('Artifact not found (did you compile first?)');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
