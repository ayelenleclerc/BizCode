# StockAjusteInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [StockAjusteInput.schema.json](../schema-json/StockAjusteInput.schema.json "open original schema") |

## StockAjusteInput Type

`object` ([StockAjusteInput](stockajusteinput.md))

# StockAjusteInput Properties

| Property              | Type      | Required | Nullable       | Defined by                                                                                   |
| :-------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [cantidad](#cantidad) | `integer` | Required | cannot be null | [StockAjusteInput](stockajusteinput-properties-cantidad.md "undefined#/properties/cantidad") |
| [motivo](#motivo)     | `string`  | Required | cannot be null | [StockAjusteInput](stockajusteinput-properties-motivo.md "undefined#/properties/motivo")     |

## cantidad



`cantidad`

* is required

* Type: `integer`

* cannot be null

* defined in: [StockAjusteInput](stockajusteinput-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`integer`

## motivo



`motivo`

* is required

* Type: `string`

* cannot be null

* defined in: [StockAjusteInput](stockajusteinput-properties-motivo.md "undefined#/properties/motivo")

### motivo Type

`string`

### motivo Constraints

**maximum length**: the maximum number of characters for this string is: `100`

**minimum length**: the minimum number of characters for this string is: `1`
