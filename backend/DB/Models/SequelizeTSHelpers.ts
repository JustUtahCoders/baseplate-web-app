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

export type ModelMap = {
  [key: string]: Model;
};

export type BelongsToMethods<Aliases extends ModelMap> = GetBelongsTo<Aliases> &
  SetBelongsTo<Aliases> &
  CreateBelongsTo<Aliases>;

type GetBelongsTo<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `get${Capitalize<Property>}`]: BelongsToGetAssociationMixin<
    Aliases[Property]
  >;
};

type SetBelongsTo<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `set${Capitalize<Property>}`]: BelongsToSetAssociationMixin<
    Aliases[Property],
    number
  >;
};
type CreateBelongsTo<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `create${Capitalize<Property>}`]: BelongsToCreateAssociationMixin<
    Aliases[Property]
  >;
};

export type HasOneMethods<Aliases extends ModelMap> = GetHasOne<Aliases> &
  SetHasOne<Aliases> &
  CreateHasOne<Aliases>;

type GetHasOne<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `get${Capitalize<Property>}`]: HasOneGetAssociationMixin<
    Aliases[Property]
  >;
};

type SetHasOne<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `set${Capitalize<Property>}`]: HasOneSetAssociationMixin<
    Aliases[Property],
    number
  >;
};
type CreateHasOne<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `create${Capitalize<Property>}`]: HasOneCreateAssociationMixin<
    Aliases[Property]
  >;
};

export type HasManyMethods<Aliases extends ModelMap> = GetHasMany<Aliases> &
  CountHasMany<Aliases> &
  HasHasMany<Aliases> &
  HasHasManyPlural<Aliases> &
  SetHasMany<Aliases> &
  AddHasMany<Aliases> &
  AddHasManyPlural<Aliases> &
  RemoveHasMany<Aliases> &
  RemoveHasManyPlural<Aliases> &
  CreateHasMany<Aliases>;

type GetHasMany<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `get${Capitalize<Property>}s`]: HasManyGetAssociationsMixin<
    Aliases[Property]
  >;
};

type CountHasMany<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `count${Capitalize<Property>}s`]: HasManyCountAssociationsMixin;
};

type HasHasMany<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `has${Capitalize<Property>}`]: HasManyHasAssociationMixin<
    Aliases[Property],
    number
  >;
};

type HasHasManyPlural<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `has${Capitalize<Property>}s`]: HasManyHasAssociationsMixin<
    Aliases[Property],
    number
  >;
};

type SetHasMany<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `set${Capitalize<Property>}s`]: HasManySetAssociationsMixin<
    Aliases[Property],
    number
  >;
};

type AddHasMany<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `add${Capitalize<Property>}`]: HasManyAddAssociationMixin<
    Aliases[Property],
    number
  >;
};

type AddHasManyPlural<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `add${Capitalize<Property>}s`]: HasManyAddAssociationsMixin<
    Aliases[Property],
    number
  >;
};

type RemoveHasMany<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `remove${Capitalize<Property>}`]: HasManyRemoveAssociationMixin<
    Aliases[Property],
    number
  >;
};

type RemoveHasManyPlural<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `remove${Capitalize<Property>}s`]: HasManyRemoveAssociationsMixin<
    Aliases[Property],
    number
  >;
};

type CreateHasMany<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `create${Capitalize<Property>}`]: HasManyCreateAssociationMixin<
    Aliases[Property],
    number
  >;
};

export type BelongsToManyMethods<Aliases extends ModelMap> =
  GetBelongsToMany<Aliases> &
    CountBelongsToMany<Aliases> &
    HasBelongsToMany<Aliases> &
    HasBelongsToManyPlural<Aliases> &
    SetBelongsToMany<Aliases> &
    AddBelongsToMany<Aliases> &
    AddBelongsToManyPlural<Aliases> &
    RemoveBelongsToMany<Aliases> &
    RemoveBelongsToManyPlural<Aliases> &
    CreateBelongsToMany<Aliases>;

type GetBelongsToMany<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `get${Capitalize<Property>}s`]: BelongsToManyGetAssociationsMixin<
    Aliases[Property]
  >;
};

type CountBelongsToMany<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `count${Capitalize<Property>}s`]: BelongsToManyCountAssociationsMixin;
};

type HasBelongsToMany<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `has${Capitalize<Property>}`]: BelongsToManyHasAssociationMixin<
    Aliases[Property],
    number
  >;
};

type HasBelongsToManyPlural<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `has${Capitalize<Property>}s`]: BelongsToManyHasAssociationsMixin<
    Aliases[Property],
    number
  >;
};

type SetBelongsToMany<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `set${Capitalize<Property>}s`]: BelongsToManySetAssociationsMixin<
    Aliases[Property],
    number
  >;
};

type AddBelongsToMany<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `add${Capitalize<Property>}`]: BelongsToManyAddAssociationMixin<
    Aliases[Property],
    number
  >;
};

type AddBelongsToManyPlural<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `add${Capitalize<Property>}s`]: BelongsToManyAddAssociationsMixin<
    Aliases[Property],
    number
  >;
};

type RemoveBelongsToMany<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `remove${Capitalize<Property>}`]: BelongsToManyRemoveAssociationMixin<
    Aliases[Property],
    number
  >;
};

type RemoveBelongsToManyPlural<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `remove${Capitalize<Property>}s`]: BelongsToManyRemoveAssociationsMixin<
    Aliases[Property],
    number
  >;
};

type CreateBelongsToMany<Aliases extends ModelMap> = {
  [Property in keyof Aliases &
    string as `create${Capitalize<Property>}`]: BelongsToManyCreateAssociationMixin<
    Aliases[Property]
  >;
};

export type ModelWithIncludes<MainModel, IncludedModels> = MainModel & {
  [Property in keyof IncludedModels &
    string as Property]: IncludedModels[Property];
};

export type BaseplateUUID = string;
