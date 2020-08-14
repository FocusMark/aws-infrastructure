const axios = require('axios');

class GoDaddyRequest {
    constructor(apiUrl, secret) {
        this.apiUrl = apiUrl;
        this.secret = secret;
    }
    
    async setNameservers(nameservers) {
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
        
        try {
            // AWS naming conventions for their nameservers: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/SOA-NSrecords.html
            //let t1 = await instance.get(this.apiUrl);
            //const response = await instance.put(this.apiUrl, newNameservers);
            //console.info(response.data);
        } catch(err) {
            console.info(err.response.data);
        }
        
    }
}

module.exports = GoDaddyRequest;