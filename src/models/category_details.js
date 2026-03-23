import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class CategoryDetail extends Model {
    static associate(models) {
      CategoryDetail.belongsTo(models.Categories, {
        foreignKey: "categoriesId",
        targetKey: "categoriesId",
        as: "category",
      });
    }
  }

  CategoryDetail.init(
    {
      categoryDetailId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "category_detail_ID",
      },
      origin: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      roastLevel: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      processing: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      categoriesId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "categories_ID",
      },
    },
    {
      sequelize,
      modelName: "CategoryDetail",
      tableName: "category_details",
      timestamps: false,
    }
  );

  return CategoryDetail;
};
