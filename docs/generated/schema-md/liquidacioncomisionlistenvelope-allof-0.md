# Untitled object in LiquidacionComisionListEnvelope Schema

```txt
undefined#/allOf/0
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LiquidacionComisionListEnvelope.schema.json\*](../schema-json/LiquidacionComisionListEnvelope.schema.json "open original schema") |

## 0 Type

`object` ([Details](liquidacioncomisionlistenvelope-allof-0.md))

# 0 Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [LiquidacionComisionListEnvelope](liquidacioncomisionlistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [LiquidacionComisionListEnvelope](liquidacioncomisionlistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([LiquidacionComision](liquidacioncomision.md))

* cannot be null

* defined in: [LiquidacionComisionListEnvelope](liquidacioncomisionlistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")

### data Type

`object[]` ([LiquidacionComision](liquidacioncomision.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LiquidacionComisionListEnvelope](liquidacioncomisionlistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success")

### success Type

`boolean`

### success Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `true` |             |
