Moralis.Cloud.define("getReward", async (request) => {
	const User = Moralis.Object.extend("User");
	const query = new Moralis.Query(User);
  	query.equalTo("ethAddress", request.params.address);
  	const user = await query.first({useMasterKey: true});
    if (user) {
      return {"status": "Success", "reward": user.attributes.reward};
    } else {
      return {"status": "Error", "msg": "Cannot found user"};
    }
});

Moralis.Cloud.define("resetReward", async (request) => {
	const User = Moralis.Object.extend("User");
	const query = new Moralis.Query(User);
  	query.equalTo("ethAddress", request.params.address);
  	const user = await query.first({useMasterKey: true});
    if (user) {
    	user.set("reward", 0);
      	user.save(null, {useMasterKey: true});
      return {"status": "Success"};
    } else {
      return {"status": "Error", "msg": "Cannot found user"};
    }
});

Moralis.Cloud.define("submitScore", async (request) => {
  	try {
    	const User = Moralis.Object.extend("User");
		const query = new Moralis.Query(User);
  		query.equalTo("objectId", request.user.id);
  		const user = await query.first({useMasterKey: true});
 
    	const oldReward = user.attributes.reward;
      	const earnedReward = request.params.score;
      	const totalReward = oldReward + earnedReward;
      
        const oldHighscore = user.attributes.highscore;
        const highscore = oldHighscore < request.params.score ? request.params.score : oldHighscore;
        user.set('highscore', highscore);
    	user.set('reward', totalReward);
    	user.save(null, {useMasterKey: true});
    	return {status: "Success", totalReward, earnedReward, highscore};
	} catch (error) {
    	return {status: "Error", msg: error};
    }
});

Moralis.Cloud.define("getAvjBalance", async (request) => {
  	try {
    	const User = Moralis.Object.extend("User");
		const query = new Moralis.Query(User);
  		query.equalTo("objectId", request.user.id);
  		const user = await query.first({useMasterKey: true});
        
        const ContractAbi = Moralis.Object.extend("Abi");
    	const contractQuery = new Moralis.Query(ContractAbi);
    	contractQuery.equalTo("name", "avj");
    	const avjContract = await contractQuery.first();
      	const web3 = Moralis.web3ByChain("0x89");
      	const contract = new web3.eth.Contract(avjContract.attributes.abi, avjContract.attributes.contractAddress);

    	const balance = await contract.methods['balanceOf'](user.attributes.ethAddress).call();
      
    	return {status: "Success", balance};
	} catch (error) {
    	return {status: "Error", msg: error.message};
    }
});

Moralis.Cloud.define("submitScore2", async (request) => {
  	try {
        const ContractAbi = Moralis.Object.extend("Abi");
    	const contractQuery = new Moralis.Query(ContractAbi);
    	contractQuery.equalTo("name", "diamond");
    	const diamondContract = await contractQuery.first();
      	const web3 = Moralis.web3ByChain("0x89");
      	const contract = new web3.eth.Contract(diamondContract.attributes.abi, diamondContract.attributes.contractAddress);
      	const gotchiInBlockchain = await contract.methods['getAavegotchi'](request.params.tokenId).call();
      	const baseLevel = gotchiInBlockchain.level;
      
      	const Gotchi = Moralis.Object.extend("Gotchi");
		const gotchiQuery = new Moralis.Query(Gotchi);
  		gotchiQuery.equalTo("tokenId", request.params.tokenId);
  		const gotchiInDB = await gotchiQuery.first(); 
      
      	const level = baseLevel + gotchiInDB.attributes.level;
 
        const calculateReward = score => {
    		return score + level/5.0 * Math.floor(score/50)*50;
    	};
 
        const User = Moralis.Object.extend("User");
		const query = new Moralis.Query(User);
  		query.equalTo("objectId", request.user.id);
  		const user = await query.first({useMasterKey: true});
      
    	const oldReward = user.attributes.reward;
      	const earnedReward = calculateReward(request.params.score);
      	const totalReward = oldReward + earnedReward;
    	user.set('reward', totalReward);
    	user.save(null, {useMasterKey: true});
    	return {status: "Success", totalReward, earnedReward};
	} catch (error) {
    	return {status: "Error", msg: error.message};
    }
});