import graphqlServer from "./framework/graphql/index";
import apiServer from "./framework/api-server/index";

export default async function (dir, app) {
    graphqlServer(dir, app);
    apiServer(dir, app);
    return {
        connection: {
        }
    };
}