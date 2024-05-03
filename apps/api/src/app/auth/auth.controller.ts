import { Controller, HttpStatus, Logger, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TsRestException, TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { contracts } from '@myorg/api-client';
import {type Response, Request} from 'express'
import { FirebaseAuthGuard, ReqWithUser } from './guards/firebase-auth.guard';

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
        this.logger.log('chay vo day')
        const accessToken = headers.authorization.replace('Bearer ', '')
        try {
           //1. verify the access token and get the user info from our database
        
           const {userInfo} = await this.authService.verifyAndUpsertUser(accessToken)
           //xai accessToken o day luon boi vi o tren dung verifyAndUserUser neu gap loi thi no nhay vao catch error luon
           const {expiresIn, sessionCookie} = await this.authService.createSessionCookie(accessToken)

           //2.create the session token with firebase 
           res.cookie('session', sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV === 'production' ? 'none': 'lax',
           })
           return {
            status: HttpStatus.OK,
            body: userInfo
           }
        } catch(error) {
            if(error instanceof Error) {
                return {
                    status: 500,
                    body: {
                        message: `Internal server error error ${error}`
                    }
                }
            }
            this.logger.error(error)
            return {
                status: 500,
                body: {
                    message: 'Internal server error'
                }
            }
        }
       })
       
    }
    @TsRestHandler(contracts.auth.me)
    @UseGuards(FirebaseAuthGuard)
    public async me(@Req() req:ReqWithUser) {
        return tsRestHandler(contracts.auth.me, async () => {
            try {
            return {
                status: HttpStatus.OK,
                body: await this.authService.getUserInfo(req.user.email)
            }
            } catch (error) {
                this.logger.error(`Error at /me ${error}`)
                return {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    body: {
                        message: 'Internal server error'
                    }
                }
            }
        })
    }
    @TsRestHandler(contracts.auth.logout)
    @UseGuards(FirebaseAuthGuard)
    public async logout(@Res({passthrough: true}) res:Response, @Req() req: ReqWithUser) {
        return tsRestHandler(contracts.auth.logout, async () => {
            try {
                await this.authService.revokeToken(req.cookies.session)
                res.clearCookie('session')
            return {
                status: HttpStatus.OK,
                body: null
            }
            } catch (error) {
                if(error instanceof TsRestException) throw error
                this.logger.error(`Error at /logout ${error}`)
                return {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    body: {
                        message: 'Internal server error'
                    }
                }
            }
        })
    }
}
