import {
  BelongsToManyGetAssociationsMixin,
  Model,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
  HasOneCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyCreateAssociationMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
} from "sequelize";

export type BelongsToMethods<Aliases, OtherModel extends Model> = GetBelongsTo<
  Aliases,
  OtherModel
> &
  SetBelongsTo<Aliases, OtherModel> &
  CreateBelongsTo<Aliases, OtherModel>;

type GetBelongsTo<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `get${Capitalize<Property>}`]: BelongsToGetAssociationMixin<OtherModel>;
};

type SetBelongsTo<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `set${Capitalize<Property>}`]: BelongsToSetAssociationMixin<
    OtherModel,
    number
  >;
};
type CreateBelongsTo<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `create${Capitalize<Property>}`]: BelongsToCreateAssociationMixin<OtherModel>;
};

export type HasOneMethods<Aliases, OtherModel extends Model> = GetHasOne<
  Aliases,
  OtherModel
> &
  SetHasOne<Aliases, OtherModel> &
  CreateHasOne<Aliases, OtherModel>;

type GetHasOne<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `get${Capitalize<Property>}`]: HasOneGetAssociationMixin<OtherModel>;
};

type SetHasOne<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `set${Capitalize<Property>}`]: HasOneSetAssociationMixin<
    OtherModel,
    number
  >;
};
type CreateHasOne<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `create${Capitalize<Property>}`]: HasOneCreateAssociationMixin<OtherModel>;
};

export type HasManyMethods<Aliases, OtherModel extends Model> = GetHasMany<
  Aliases,
  OtherModel
> &
  CountHasMany<Aliases, OtherModel> &
  HasHasMany<Aliases, OtherModel> &
  HasHasManyPlural<Aliases, OtherModel> &
  SetHasMany<Aliases, OtherModel> &
  AddHasMany<Aliases, OtherModel> &
  AddHasManyPlural<Aliases, OtherModel> &
  RemoveHasMany<Aliases, OtherModel> &
  RemoveHasManyPlural<Aliases, OtherModel> &
  CreateHasMany<Aliases, OtherModel>;

type GetHasMany<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `get${Capitalize<Property>}s`]: HasManyGetAssociationsMixin<OtherModel>;
};

type CountHasMany<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `count${Capitalize<Property>}s`]: HasManyCountAssociationsMixin;
};

type HasHasMany<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `has${Capitalize<Property>}`]: HasManyHasAssociationMixin<
    OtherModel,
    number
  >;
};

type HasHasManyPlural<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `has${Capitalize<Property>}s`]: HasManyHasAssociationsMixin<
    OtherModel,
    number
  >;
};

type SetHasMany<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `set${Capitalize<Property>}s`]: HasManySetAssociationsMixin<
    OtherModel,
    number
  >;
};

type AddHasMany<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `add${Capitalize<Property>}`]: HasManyAddAssociationMixin<
    OtherModel,
    number
  >;
};

type AddHasManyPlural<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `add${Capitalize<Property>}s`]: HasManyAddAssociationsMixin<
    OtherModel,
    number
  >;
};

type RemoveHasMany<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `remove${Capitalize<Property>}`]: HasManyRemoveAssociationMixin<
    OtherModel,
    number
  >;
};

type RemoveHasManyPlural<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `remove${Capitalize<Property>}s`]: HasManyRemoveAssociationsMixin<
    OtherModel,
    number
  >;
};

type CreateHasMany<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `create${Capitalize<Property>}`]: HasManyCreateAssociationMixin<
    OtherModel,
    number
  >;
};

export type BelongsToManyMethods<
  Aliases,
  OtherModel extends Model
> = GetBelongsToMany<Aliases, OtherModel> &
  CountBelongsToMany<Aliases, OtherModel> &
  HasBelongsToMany<Aliases, OtherModel> &
  HasBelongsToManyPlural<Aliases, OtherModel> &
  SetBelongsToMany<Aliases, OtherModel> &
  AddBelongsToMany<Aliases, OtherModel> &
  AddBelongsToManyPlural<Aliases, OtherModel> &
  RemoveBelongsToMany<Aliases, OtherModel> &
  RemoveBelongsToManyPlural<Aliases, OtherModel> &
  CreateBelongsToMany<Aliases, OtherModel>;

type GetBelongsToMany<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `get${Capitalize<Property>}s`]: BelongsToManyGetAssociationsMixin<OtherModel>;
};

type CountBelongsToMany<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `count${Capitalize<Property>}s`]: BelongsToManyCountAssociationsMixin;
};

type HasBelongsToMany<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `has${Capitalize<Property>}`]: BelongsToManyHasAssociationMixin<
    OtherModel,
    number
  >;
};

type HasBelongsToManyPlural<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `has${Capitalize<Property>}s`]: BelongsToManyHasAssociationsMixin<
    OtherModel,
    number
  >;
};

type SetBelongsToMany<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `set${Capitalize<Property>}s`]: BelongsToManySetAssociationsMixin<
    OtherModel,
    number
  >;
};

type AddBelongsToMany<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `add${Capitalize<Property>}`]: BelongsToManyAddAssociationMixin<
    OtherModel,
    number
  >;
};

type AddBelongsToManyPlural<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `add${Capitalize<Property>}s`]: BelongsToManyAddAssociationsMixin<
    OtherModel,
    number
  >;
};

type RemoveBelongsToMany<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `remove${Capitalize<Property>}`]: BelongsToManyRemoveAssociationMixin<
    OtherModel,
    number
  >;
};

type RemoveBelongsToManyPlural<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `remove${Capitalize<Property>}s`]: BelongsToManyRemoveAssociationsMixin<
    OtherModel,
    number
  >;
};

type CreateBelongsToMany<Aliases, OtherModel extends Model> = {
  [Property in keyof Aliases &
    string as `create${Capitalize<Property>}`]: BelongsToManyCreateAssociationMixin<OtherModel>;
};

export type ModelWithIncludes<MainModel, IncludedModels> = MainModel & {
  [Property in keyof IncludedModels &
    string as Property]: IncludedModels[Property];
};

export type BaseplateUUID = string;
