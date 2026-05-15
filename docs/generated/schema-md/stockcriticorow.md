# StockCriticoRow Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [StockCriticoRow.schema.json](../schema-json/StockCriticoRow.schema.json "open original schema") |

## StockCriticoRow Type

`object` ([StockCriticoRow](stockcriticorow.md))

# StockCriticoRow Properties

| Property              | Type      | Required | Nullable       | Defined by                                                                               |
| :-------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------- |
| [articulo](#articulo) | `object`  | Required | cannot be null | [StockCriticoRow](stockcriticoarticulo.md "undefined#/properties/articulo")              |
| [deficit](#deficit)   | `integer` | Required | cannot be null | [StockCriticoRow](stockcriticorow-properties-deficit.md "undefined#/properties/deficit") |
| [minimo](#minimo)     | `integer` | Required | cannot be null | [StockCriticoRow](stockcriticorow-properties-minimo.md "undefined#/properties/minimo")   |
| [stock](#stock)       | `integer` | Required | cannot be null | [StockCriticoRow](stockcriticorow-properties-stock.md "undefined#/properties/stock")     |

## articulo



`articulo`

* is required

* Type: `object` ([StockCriticoArticulo](stockcriticoarticulo.md))

* cannot be null

* defined in: [StockCriticoRow](stockcriticoarticulo.md "undefined#/properties/articulo")

### articulo Type

`object` ([StockCriticoArticulo](stockcriticoarticulo.md))

## deficit



`deficit`

* is required

* Type: `integer`

* cannot be null

* defined in: [StockCriticoRow](stockcriticorow-properties-deficit.md "undefined#/properties/deficit")

### deficit Type

`integer`

### deficit Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## minimo



`minimo`

* is required

* Type: `integer`

* cannot be null

* defined in: [StockCriticoRow](stockcriticorow-properties-minimo.md "undefined#/properties/minimo")

### minimo Type

`integer`

## stock



`stock`

* is required

* Type: `integer`

* cannot be null

* defined in: [StockCriticoRow](stockcriticorow-properties-stock.md "undefined#/properties/stock")

### stock Type

`integer`
