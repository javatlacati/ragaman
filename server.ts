import {Application, send, isHttpError, Status} from 'https://deno.land/x/oak@v4.0.0/mod.ts';

const PORT_NUMBER: number = 8085;
const app: Application = new Application();

// Middleware
app.use(async (context) => {
    try {
        await send(context, context.request.url.pathname, {
            root: Deno.cwd(),
            index: "index.html",
        })
    } catch (err) {
        console.log(err)
        if (isHttpError(err)) {
            switch (err.status) {
                case 404:
                    context.response.headers = new Headers({"Content-Type": "text/html"});
                    context.response.body = '<H1>Not found</H1>';
                    break;
                default:
                    console.log(err)
            }
        } else {
            // rethrow if you can't handle the error
            throw err;
        }
    }
    ;
});

// Middleware para Vue.js router modo history
// const history = require('connect-history-api-fallback');
// app.use(history());


const server = await app.listen({port: PORT_NUMBER});
console.log("app listening on PORT_NUMBER " + PORT_NUMBER);
