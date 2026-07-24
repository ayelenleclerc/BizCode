# LiquidacionGenerarInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LiquidacionGenerarInput.schema.json](../schema-json/LiquidacionGenerarInput.schema.json "open original schema") |

## LiquidacionGenerarInput Type

`object` ([LiquidacionGenerarInput](liquidaciongenerarinput.md))

# LiquidacionGenerarInput Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [periodo](#periodo)       | `string`  | Required | cannot be null | [LiquidacionGenerarInput](liquidaciongenerarinput-properties-periodo.md "undefined#/properties/periodo")       |
| [vendedorId](#vendedorid) | `integer` | Optional | cannot be null | [LiquidacionGenerarInput](liquidaciongenerarinput-properties-vendedorid.md "undefined#/properties/vendedorId") |

## periodo



`periodo`

* is required

* Type: `string`

* cannot be null

* defined in: [LiquidacionGenerarInput](liquidaciongenerarinput-properties-periodo.md "undefined#/properties/periodo")

### periodo Type

`string`

### periodo Constraints

**pattern**: the string must match the following regular expression:&#x20;

```regexp
^\d{4}-\d{2}$
```

[try pattern](https://regexr.com/?expression=%5E%5Cd%7B4%7D-%5Cd%7B2%7D%24 "try regular expression with regexr.com")

## vendedorId



`vendedorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [LiquidacionGenerarInput](liquidaciongenerarinput-properties-vendedorid.md "undefined#/properties/vendedorId")

### vendedorId Type

`integer`

### vendedorId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
