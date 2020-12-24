import 'mocha';
import { expect } from 'chai';
import { handler } from '../src/handler';

describe('Lambda handler', () => {
    it('should return an object', async () => {
        const lambdaResponse = await handler();
        
        expect(lambdaResponse).to.exist;
    });
    
    it('should include status code of 200', async () => {
        const lambdaResponse = await handler();

        expect(lambdaResponse).to.have.property('statusCode');
        expect(lambdaResponse['statusCode']).to.equal(200);
    });
    
    it('should include body', async () => {
        const lambdaResponse = await handler();

        expect(lambdaResponse).to.have.property('body');
        expect(lambdaResponse['body']).to.equal('test');
    });
});