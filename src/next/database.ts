import { Sequelize } from "sequelize";

export const getAllRelationships = (dbName: String) => {
  return `
    SELECT *
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE CONSTRAINT_SCHEMA = '${dbName}'
      AND REFERENCED_TABLE_SCHEMA IS NOT NULL
      AND REFERENCED_TABLE_NAME IS NOT NULL
      AND REFERENCED_COLUMN_NAME IS NOT NULL
  `;
};

export const useDatabase = async function (obj: any) {
  let sequelize = new Sequelize(obj.name, obj.username, obj.password, {
    host: obj.host,
    dialect: "mysql",
    logging: false,
  });
  try {
    await sequelize.authenticate();
    (sequelize as any).relationships = await sequelize.query(
      getAllRelationships(obj.name)
    );
    console.log(`[DB] Succcessfully connected to database ${obj.name}`);
  } catch (e) {
    throw new Error(`[DB] Error connecting to database ${obj.name}`);
  }
  return {
    instance: sequelize,
  };
};

export const applyRelationshipsFromStoreToDatabase = (store, app) => {
  store.database.relationships.forEach((element) => {
    const currentTable = app.modules[element.currentModule].tableInstance;
    const referencedTable = app.modules[element.referencedModule].tableInstance;
    // element.type willbe hasOne, hasMany, belongsTo or belongsToMany
    currentTable[element.type](referencedTable, element.options || {});
  });
};
