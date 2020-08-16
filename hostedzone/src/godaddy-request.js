const axios = require('axios');

class GoDaddyRequest {
    constructor(apiUrl, secret) {
        this.apiUrl = apiUrl;
        this.secret = secret;
    }
    
    setNameservers(nameservers) {
        console.info('Building the Nameservers list');
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
        // AWS naming conventions for their nameservers: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/SOA-NSrecords.html
        //let t1 = await instance.get(this.apiUrl);
        //const response = await instance.put(this.apiUrl, newNameservers);
        //console.info(response.data);
        
        console.info('Nameserver setting completed');
    }
}

module.exports = GoDaddyRequest;