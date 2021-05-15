export default {
  name: "Wertik",
  builtinModules: "user,auth,forgetPassword,permission,role,rolePermission,userPermission,userRole,storage,email,backup",
  database: {
    dbDialect: process.env.dbDialect,
    dbUsername: process.env.dbUsername,
    dbPassword: process.env.dbPassword,
    dbName: process.env.dbName,
    dbHost: process.env.dbHost,
    dbPort: process.env.dbPort,
  },
  port: 5000,
  frontendAppUrl: "http://localhost:8080/",
  frontendAppActivationUrl: "http://localhost:8080/activate-account",
  frontendAppPasswordResetUrl: "http://localhost:8080/reset-password",
  context: {
    initializeContext: function (mode, context) {
      return {
        someKey: "somekeyvalue",
      };
    },
    requestContext: async function (mode, context) {
      return {
        value: "Value 1",
      };
    },
  },
  email: {
    disable: false,
  },
  graphql: {
    disable: false,
  },
  restApi: {
    useCors: true,
    useBodyParser: true,
    useMorgan: true,
    showWertik404Page: true,
    onCustomApiFailure: function ({ path, res, err }) {
      res.send("failed at " + path);
    },
    // Below function for custom 404 page or response.
    // restApi404Handler: function () {}
  },
  backup: {
    digitalOceanSpaces: {
      accessKeyId: "",
      secretAccessKey: "",
      spacesEndpoint: "",
      uploadParams: {
        Bucket: "",
        ACL: "",
      },
    },
    dropbox: {
      accessToken: "",
    },
  },
  modules: [
    {
      name: "Article",
      graphql: {
        crud: {
          query: {
            generate: true,
            operations: "*",
          },
          mutation: {
            generate: true,
            operations: "*",
          },
        },
        schema: `
          type Article {
            id: Int
            title: String
            description: String
            created_at: String
            updated_at: String
          }
          input ArticleInput {
            title: String
            description: String
          }
        `,
        mutation: {
          schema: ``,
          resolvers: {},
        },
        query: {
          schema: ``,
          resolvers: {},
        },
      },
      restApi: {
        endpoints: [
          {
            path: "/relations",
            methodType: "get",
            handler: async function (req, res) {
              const models = req.wertik.models;
              const { UserPermission, User, Permission, UserRole, Role } = models;
              const All = await User.findOne({
                where: {
                  id: 1,
                },
                attributes: ["id", "email"],
                include: [
                  {
                    model: UserRole,
                    as: "user_roles",
                    attributes: ["id", "user_id", "role_id"],
                    include: [
                      {
                        model: Role,
                        as: "role",
                        attributes: ["id", "name"],
                      },
                      {
                        model: User,
                        as: "user",
                        attributes: ["id", "email"],
                      },
                    ],
                  },
                  {
                    model: UserPermission,
                    as: "user_permissions",
                    attributes: ["id", "user_id", "permission_id"],
                    include: [
                      {
                        model: User,
                        as: "user",
                        attributes: ["id", "email"],
                      },
                      {
                        model: Permission,
                        as: "permission",
                        attributes: ["id", "can", "cant"],
                      },
                    ],
                  },
                ],
              });
              res.json({
                message: true,
                data: {
                  user: All,
                },
              });
            },
          },
        ],
      },
      database: {
        sql: {
          tableName: "article",
          fields: {
            title: {
              type: "STRING",
            },
            description: {
              type: "STRING",
            },
          },
        },
      },
    },
  ],
  events: {
    beforeGraphqlStart: function () {
      console.log("beforeGraphqlStart");
    },
    beforeRestApiStart: function () {
      console.log("beforeRestApiStart");
    },
    graphql: {
      Role: {
        beforeBulkCreate({ mode, params: { args, context } }) {
          return args;
        },
      },
      User: {
        beforeBulkCreate() {
          throw new Error("Use signup mutation.");
        },
      },
    },
  },
  sockets: {
    disable: false,
    middlewares: [
      async ({ socket, next, context }) => {
        console.log("Message while running a socket middleware");
        console.log("Validate your realtime user here. All context is available.");
        next();
      },
    ],
    onClientConnected: function ({ socket, context }) {
      console.log("client is connected");
      /*

      This runs when a user is connected to realtime server, Use middlewares to secure your socket server.

      */
      socket.on("message", (val) => {
        console.log(`message`, val);
      });
      socket.on("disconnect", () => {
        console.log(`disconnect`);
      });
    },
  },
  storage: {
    storageDirectory: "./uploads/",
  },
  cron: {
    cronList: [
      {
        expression: "* * * * *",
        function: (context) => {
          // app context is available in context variable.
        },
        options: {},
        events: {
          initialized(i) {},
        },
      },
    ],
  },
};
