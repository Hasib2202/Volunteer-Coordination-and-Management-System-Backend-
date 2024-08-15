// import * as session from 'express-session';
// import * as connectRedis from 'connect-redis';
// import { redisClient } from '../redis/redis.client';  // Assuming you have a redis client setup

// const RedisStore = connectRedis(session);

// export const sessionConfig = session({
//   store: new RedisStore({ client: redisClient }),
//   secret: 'your-session-secret',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: false, // Set to true if using HTTPS
//     httpOnly: true,
//     maxAge: 1000 * 60 * 60 * 24, // 1 day
//   },
// });

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.session.email !== undefined;
  }
}
