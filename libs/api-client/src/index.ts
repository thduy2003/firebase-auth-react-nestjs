import { initContract } from '@ts-rest/core';
import { authContract } from './lib/api-contracts';

export * from './lib/api-contracts';
const c = initContract();
// setting the end point for this contract 
//this way we can merge nested routers 
export const contracts = c.router({
    auth: authContract
})