const axios = require('axios');

class GoDaddyRequest {
    constructor(apiUrl, secret) {
        this.apiUrl = apiUrl;
        this.secret = secret;
    }
    
    async setNameservers(nameservers) {
        console.info('Building the Nameservers list');
        if (!nameservers || nameservers.length === 0) {
            console.info('Setting Nameservers failed due to no nameservers being provided.');
            throw new Error('No nameservers found');
        }
        
        let newNameservers = nameservers.map(server => {
            return {
                type: 'NS',
                name: server,
                data: server
            }
        });
            
        const instance = axios.create({
            headers: {'Authorization': `sso-key ${this.secret}`},
            timeout: 60000
        });
        
        console.info('Setting nameservers');
        console.info(newNameservers);
        
        let response = await instance.put(this.apiUrl, newNameservers);
        console.info('Nameserver setting completed');
        console.info(response.data);
    }
}

module.exports = GoDaddyRequest;