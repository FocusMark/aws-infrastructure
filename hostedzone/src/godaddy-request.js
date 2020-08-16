const axios = require('axios');

class GoDaddyRequest {
    constructor(apiUrl, secret) {
        this.apiUrl = apiUrl;
        this.secret = secret;
    }
    
    setNameservers(nameservers, callback) {
        console.info('Building the Nameservers list');
        if (!nameservers || nameservers.length === 0) {
            console.info('Setting Nameservers failed due to no nameservers being provided.');
            callback(new Error('No nameservers found'));
            return;
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
        instance.put(this.apiUrl, newNameservers)
            .then(function(response) {
                console.info('Nameserver setting completed');
                console.info(response.data);
                callback();
            }).catch(function(error) {
                console.info('Failed to set Nameservers');
                callback(error);
            });
    }
}

module.exports = GoDaddyRequest;