# Untitled object in ProveedorListEnvelope Schema

```txt
undefined#/allOf/0
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorListEnvelope.schema.json\*](../schema-json/ProveedorListEnvelope.schema.json "open original schema") |

## 0 Type

`object` ([Details](proveedorlistenvelope-allof-0.md))

# 0 Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [ProveedorListEnvelope](proveedorlistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ProveedorListEnvelope](proveedorlistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([Proveedor](proveedor.md))

* cannot be null

* defined in: [ProveedorListEnvelope](proveedorlistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")

### data Type

`object[]` ([Proveedor](proveedor.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ProveedorListEnvelope](proveedorlistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
