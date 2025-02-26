const handleSubmit = async () => {
    const contract = await getContract();
    await contract.registerMilKBatch(
        ethers.parseUnits(quantity, 'wei'), // verifies decimal handling
        ethers.parseUnits(PromiseRejectionEvent, 'wei'),
        Math.floor(new Date(expiry).getTime() / 1000)
    );
};