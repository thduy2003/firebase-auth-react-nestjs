import { Controller, Logger, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { contracts } from '@myorg/api-client';
/*
now if you recall and if I come here to the login contract we have this path to be /login and the path prefix to be /auth 
that means that here in the controller we must get rid of this prefix because it is being handled automatically by the contract
*/
@Controller()
export class AuthController {
    private readonly logger = new Logger(AuthController.name)
    constructor(private readonly authService: AuthService) {}
    /*this decorator (@TsRestHandler) , this decorator will generate it's like a factory for more decorators that the library needs internally 
    to be able to map the contract with the actual endpoint*/
    @TsRestHandler(contracts.auth.login)
    /*the reason we use passthrough is because the library needs total control of the response so we need to tell nestjs, 
    we just need the reponse to set some configuration like cookies but I'm delegating the actual response to the library so that I don't have to do it */
    /**we can see we get the Headers and we can see authorization property and this all comes from the S schema we declared  */
    public async login(@Res({passthrough: true}) res: Response) {
       return tsRestHandler(contracts.auth.login, async ({headers}) => {
        const accessToken = headers.authorization.replace('Bearer', '')
        return {
            status: 200,
            body: null
        }
       })
       
    }
}
