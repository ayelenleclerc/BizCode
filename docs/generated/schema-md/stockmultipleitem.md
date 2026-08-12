# StockMultipleItem Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [StockMultipleItem.schema.json](../schema-json/StockMultipleItem.schema.json "open original schema") |

## StockMultipleItem Type

`object` ([StockMultipleItem](stockmultipleitem.md))

# StockMultipleItem Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid) | `integer` | Required | cannot be null | [StockMultipleItem](stockmultipleitem-properties-articuloid.md "undefined#/properties/articuloId") |
| [estado](#estado)         | `string`  | Required | cannot be null | [StockMultipleItem](sellerstockestado.md "undefined#/properties/estado")                           |
| [stock](#stock)           | `number`  | Required | cannot be null | [StockMultipleItem](stockmultipleitem-properties-stock.md "undefined#/properties/stock")           |
| [stockMin](#stockmin)     | `number`  | Required | cannot be null | [StockMultipleItem](stockmultipleitem-properties-stockmin.md "undefined#/properties/stockMin")     |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [StockMultipleItem](stockmultipleitem-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## estado



`estado`

* is required

* Type: `string` ([SellerStockEstado](sellerstockestado.md))

* cannot be null

* defined in: [StockMultipleItem](sellerstockestado.md "undefined#/properties/estado")

### estado Type

`string` ([SellerStockEstado](sellerstockestado.md))

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value    | Explanation |
| :------- | :---------- |
| `"ok"`   |             |
| `"bajo"` |             |
| `"cero"` |             |

## stock



`stock`

* is required

* Type: `number`

* cannot be null

* defined in: [StockMultipleItem](stockmultipleitem-properties-stock.md "undefined#/properties/stock")

### stock Type

`number`

## stockMin



`stockMin`

* is required

* Type: `number`

* cannot be null

* defined in: [StockMultipleItem](stockmultipleitem-properties-stockmin.md "undefined#/properties/stockMin")

### stockMin Type

`number`
