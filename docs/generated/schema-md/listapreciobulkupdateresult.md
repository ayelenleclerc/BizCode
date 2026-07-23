# ListaPrecioBulkUpdateResult Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ListaPrecioBulkUpdateResult.schema.json](../schema-json/ListaPrecioBulkUpdateResult.schema.json "open original schema") |

## ListaPrecioBulkUpdateResult Type

`object` ([ListaPrecioBulkUpdateResult](listapreciobulkupdateresult.md))

# ListaPrecioBulkUpdateResult Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                                                           |
| :---------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [afectados](#afectados) | `integer` | Required | cannot be null | [ListaPrecioBulkUpdateResult](listapreciobulkupdateresult-properties-afectados.md "undefined#/properties/afectados") |
| [ejemplos](#ejemplos)   | `array`   | Required | cannot be null | [ListaPrecioBulkUpdateResult](listapreciobulkupdateresult-properties-ejemplos.md "undefined#/properties/ejemplos")   |
| [preview](#preview)     | `boolean` | Required | cannot be null | [ListaPrecioBulkUpdateResult](listapreciobulkupdateresult-properties-preview.md "undefined#/properties/preview")     |
| [success](#success)     | `boolean` | Required | cannot be null | [ListaPrecioBulkUpdateResult](listapreciobulkupdateresult-properties-success.md "undefined#/properties/success")     |

## afectados



`afectados`

* is required

* Type: `integer`

* cannot be null

* defined in: [ListaPrecioBulkUpdateResult](listapreciobulkupdateresult-properties-afectados.md "undefined#/properties/afectados")

### afectados Type

`integer`

## ejemplos



`ejemplos`

* is required

* Type: `object[]` ([Details](listapreciobulkupdateresult-properties-ejemplos-items.md))

* cannot be null

* defined in: [ListaPrecioBulkUpdateResult](listapreciobulkupdateresult-properties-ejemplos.md "undefined#/properties/ejemplos")

### ejemplos Type

`object[]` ([Details](listapreciobulkupdateresult-properties-ejemplos-items.md))

## preview



`preview`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ListaPrecioBulkUpdateResult](listapreciobulkupdateresult-properties-preview.md "undefined#/properties/preview")

### preview Type

`boolean`

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ListaPrecioBulkUpdateResult](listapreciobulkupdateresult-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
