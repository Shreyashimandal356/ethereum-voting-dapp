const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Voting', function () {
  async function deploy() {
    const [owner, voter1, voter2] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory('Voting');
    const voting = await Voting.deploy(['Alice', 'Bob']);
    await voting.waitForDeployment();
    return { voting, owner, voter1, voter2 };
  }

  it('starts in Created, then Voting, then Ended', async function () {
    const { voting } = await deploy();
    expect(await voting.state()).to.equal(0n); // Created
    await (await voting.start()).wait();
    expect(await voting.state()).to.equal(1n); // Voting
    await (await voting.end()).wait();
    expect(await voting.state()).to.equal(2n); // Ended
  });

  it('allows one vote per address', async function () {
    const { voting, voter1 } = await deploy();
    await (await voting.start()).wait();
    await (await voting.connect(voter1).vote(0)).wait();
    await expect(voting.connect(voter1).vote(0)).to.be.revertedWith('already voted');
    const results = await voting.results();
    expect(results[0]).to.equal(1n);
  });

  it('rejects invalid candidate index', async function () {
    const { voting } = await deploy();
    await (await voting.start()).wait();
    await expect(voting.vote(5)).to.be.revertedWith('bad index');
  });
});
