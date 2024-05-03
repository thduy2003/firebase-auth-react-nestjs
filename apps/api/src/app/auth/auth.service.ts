import { User, contracts } from '@myorg/api-client';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { admin } from './firebase-admin.module';
import { prisma } from '../prisma.module';
import { TsRestException } from '@ts-rest/nest';
import { Prisma } from '@prisma/client';
const userSelect = {
    email: true,
    img: true,
    name: true,
    id: true
} satisfies Prisma.UserSelect
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}
    public async verifyAndUpsertUser(accessToken: string): Promise<{
        decodedToken: DecodedIdToken,
        userInfo: User
    }> {
        this.logger.log(accessToken)
        const decodedToken = await admin.auth().verifyIdToken(accessToken)
        const userInfo = await prisma.user.upsert({
            where: {email: decodedToken.email},
            create: {
                email: decodedToken.email,
                name: decodedToken.name,
                img: decodedToken.picture
            },
            update: {
                name: decodedToken.name,
                img: decodedToken.picture
            },
            select: userSelect
        })
        await admin.auth().setCustomUserClaims(decodedToken.uid, {
            dbUserId: userInfo.id
        })
        return {
            decodedToken,
            userInfo
        }
    }
    public async createSessionCookie(accessToken: string): Promise<{
        expiresIn: number;
        sessionCookie: string;
    }> {
        const expiresIn: number = 60*60*24*5; // 5 days
        const sessionCookie = await admin.auth().createSessionCookie(accessToken, {
            expiresIn
        })
        return {
            expiresIn,
            sessionCookie
        }
    }
    public async getUserInfo(email: string): Promise<User>{
        const userInfo = await prisma.user.findUnique({
            where: {email},
            select: userSelect
        })
        if(!userInfo) {
            throw new TsRestException(contracts.auth.me, {
                body: {
                    message: 'User not found'
                }, 
                status: 404
            }) 
        }
        return userInfo
    }
    public async revokeToken(sessionCookie: string): Promise<void>{
        try {
            const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true)
            await admin.auth().revokeRefreshTokens(decodedClaims.sub)
        } catch (error) {
            if(error instanceof Error) {
                throw new TsRestException(contracts.auth.logout, {
                    body: {
                        message: 'You are not authorized to access this resource'
                    },
                    status: HttpStatus.UNAUTHORIZED
                })
            }
            this.logger.error(`Error revoking token ${error}`)
            throw new TsRestException(contracts.auth.logout, {
                body: {
                    message: 'Error revoking token'
                },
                status: 500
            })
        }
    }
}
