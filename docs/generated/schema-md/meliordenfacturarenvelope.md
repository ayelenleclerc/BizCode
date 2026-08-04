# MeliOrdenFacturarEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MeliOrdenFacturarEnvelope.schema.json](../schema-json/MeliOrdenFacturarEnvelope.schema.json "open original schema") |

## MeliOrdenFacturarEnvelope Type

`object` ([MeliOrdenFacturarEnvelope](meliordenfacturarenvelope.md))

# MeliOrdenFacturarEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MeliOrdenFacturarEnvelope](meliordenfacturarenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [MeliOrdenFacturarEnvelope](meliordenfacturarenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](meliordenfacturarenvelope-properties-data.md))

* cannot be null

* defined in: [MeliOrdenFacturarEnvelope](meliordenfacturarenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](meliordenfacturarenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MeliOrdenFacturarEnvelope](meliordenfacturarenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
