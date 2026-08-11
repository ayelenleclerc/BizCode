# Untitled object in VendedorZonaListEnvelope Schema

```txt
undefined#/allOf/0
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [VendedorZonaListEnvelope.schema.json\*](../schema-json/VendedorZonaListEnvelope.schema.json "open original schema") |

## 0 Type

`object` ([Details](vendedorzonalistenvelope-allof-0.md))

# 0 Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [VendedorZonaListEnvelope](vendedorzonalistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [VendedorZonaListEnvelope](vendedorzonalistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([VendedorZona](vendedorzona.md))

* cannot be null

* defined in: [VendedorZonaListEnvelope](vendedorzonalistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")

### data Type

`object[]` ([VendedorZona](vendedorzona.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [VendedorZonaListEnvelope](vendedorzonalistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
