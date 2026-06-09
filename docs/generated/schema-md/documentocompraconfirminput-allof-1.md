# Untitled object in DocumentoCompraConfirmInput Schema

```txt
undefined#/allOf/1
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DocumentoCompraConfirmInput.schema.json\*](../schema-json/DocumentoCompraConfirmInput.schema.json "open original schema") |

## 1 Type

`object` ([Details](documentocompraconfirminput-allof-1.md))

# 1 Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                                               |
| :-------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| [documentoId](#documentoid) | `integer` | Required | cannot be null | [DocumentoCompraConfirmInput](documentocompraconfirminput-allof-1-properties-documentoid.md "undefined#/allOf/1/properties/documentoId") |
| [items](#items)             | `array`   | Optional | cannot be null | [DocumentoCompraConfirmInput](documentocompraconfirminput-allof-1-properties-items.md "undefined#/allOf/1/properties/items")             |

## documentoId



`documentoId`

* is required

* Type: `integer`

* cannot be null

* defined in: [DocumentoCompraConfirmInput](documentocompraconfirminput-allof-1-properties-documentoid.md "undefined#/allOf/1/properties/documentoId")

### documentoId Type

`integer`

### documentoId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## items



`items`

* is optional

* Type: `object[]` ([DocumentoCompraItemPreview](documentocompraitempreview.md))

* cannot be null

* defined in: [DocumentoCompraConfirmInput](documentocompraconfirminput-allof-1-properties-items.md "undefined#/allOf/1/properties/items")

### items Type

`object[]` ([DocumentoCompraItemPreview](documentocompraitempreview.md))
