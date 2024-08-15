import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {   
  constructor(
  ) {
    super();
  }
  async canActivate(
  context: ExecutionContext,
): Promise<boolean> {
  const request = context.switchToHttp().getRequest();
  const token = request.headers.authorization?.split(' ')[1];

  
  console.log('Inside JWT AuthGuard canActivate');
  return super.canActivate(context) as Promise<boolean>;;
}

  handleRequest(err, user, info, context) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    } 
    context.switchToHttp().getRequest().user = user;
    return user;
  }
}