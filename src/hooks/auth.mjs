import * as jwt from 'jsonwebtoken';

import { NotProtectedRoutesList } from '../constants/routes.mjs';
// import { SECRET_WORD } from '../config/index.mjs';

const { verify } = jwt.default;

export async function auth(request, reply) {
    if (NotProtectedRoutesList.includes(request.routerPath)) {
        return;
    }
    const authHeader = request.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : null;
    try {
        const payload = await verify(token, process.env.SECRET_WORD);

        request.payload = payload;
    } catch (err) {
        reply.status(401)
            .send({ message: 'Unauthorized' });
    }
}
