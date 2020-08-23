class Configuration {
    /**
     * 
     * @constructor
     * Creates a new instance of a configuration object for message bus event services and AWS region.
     * 
     */
    constructor() {
        // get environment variables
        this.registrarSecretParameter = process.env.registrar_secret
        this.registrarApiParameter = process.env.registrar_api
    }
}

module.exports = Configuration;