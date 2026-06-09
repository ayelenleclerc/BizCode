# ModuleCatalogEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ModuleCatalogEnvelope.schema.json](../schema-json/ModuleCatalogEnvelope.schema.json "open original schema") |

## ModuleCatalogEnvelope Type

`object` ([ModuleCatalogEnvelope](modulecatalogenvelope.md))

# ModuleCatalogEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ModuleCatalogEnvelope](modulecatalogdata.md "undefined#/properties/data")                           |
| [success](#success) | `boolean` | Required | cannot be null | [ModuleCatalogEnvelope](modulecatalogenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ModuleCatalogData](modulecatalogdata.md))

* cannot be null

* defined in: [ModuleCatalogEnvelope](modulecatalogdata.md "undefined#/properties/data")

### data Type

`object` ([ModuleCatalogData](modulecatalogdata.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ModuleCatalogEnvelope](modulecatalogenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
