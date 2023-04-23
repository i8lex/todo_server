export const ROUTE_PREFIX = '/api';

export const Routes = {
    login: '/login',
    register: '/registration',
    image: '/image/:id',
    createImage: '/image',
    task: '/tasks',
    changeTask: '/tasks/:id',

    email: '/email/:code',
};

export const NotProtectedRoutes = {
    email: {
        unprefixed: Routes.email,
        get prefixed() {
            return `${ROUTE_PREFIX}${this.unprefixed}`;
        },
    },
    login: {
        unprefixed: Routes.login,
        get prefixed() {
            return `${ROUTE_PREFIX}${this.unprefixed}`;
        },
    },
    register: {
        unprefixed: Routes.register,
        get prefixed() {
            return `${ROUTE_PREFIX}${this.unprefixed}`;
        },
    },
};

export const NotProtectedRoutesList = Object.values(NotProtectedRoutes).map(
    ({ prefixed }) => prefixed
);
