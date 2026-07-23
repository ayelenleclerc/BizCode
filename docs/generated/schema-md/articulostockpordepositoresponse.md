# ArticuloStockPorDepositoResponse Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ArticuloStockPorDepositoResponse.schema.json](../schema-json/ArticuloStockPorDepositoResponse.schema.json "open original schema") |

## ArticuloStockPorDepositoResponse Type

`object` ([ArticuloStockPorDepositoResponse](articulostockpordepositoresponse.md))

# ArticuloStockPorDepositoResponse Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                                                       |
| :------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid) | `integer` | Required | cannot be null | [ArticuloStockPorDepositoResponse](articulostockpordepositoresponse-properties-articuloid.md "undefined#/properties/articuloId") |
| [depositos](#depositos)   | `array`   | Required | cannot be null | [ArticuloStockPorDepositoResponse](articulostockpordepositoresponse-properties-depositos.md "undefined#/properties/depositos")   |
| [enTransito](#entransito) | `integer` | Required | cannot be null | [ArticuloStockPorDepositoResponse](articulostockpordepositoresponse-properties-entransito.md "undefined#/properties/enTransito") |
| [stockTotal](#stocktotal) | `integer` | Required | cannot be null | [ArticuloStockPorDepositoResponse](articulostockpordepositoresponse-properties-stocktotal.md "undefined#/properties/stockTotal") |
| [success](#success)       | `boolean` | Required | cannot be null | [ArticuloStockPorDepositoResponse](articulostockpordepositoresponse-properties-success.md "undefined#/properties/success")       |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ArticuloStockPorDepositoResponse](articulostockpordepositoresponse-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## depositos



`depositos`

* is required

* Type: `object[]` ([StockDeposito](stockdeposito.md))

* cannot be null

* defined in: [ArticuloStockPorDepositoResponse](articulostockpordepositoresponse-properties-depositos.md "undefined#/properties/depositos")

### depositos Type

`object[]` ([StockDeposito](stockdeposito.md))

## enTransito



`enTransito`

* is required

* Type: `integer`

* cannot be null

* defined in: [ArticuloStockPorDepositoResponse](articulostockpordepositoresponse-properties-entransito.md "undefined#/properties/enTransito")

### enTransito Type

`integer`

## stockTotal



`stockTotal`

* is required

* Type: `integer`

* cannot be null

* defined in: [ArticuloStockPorDepositoResponse](articulostockpordepositoresponse-properties-stocktotal.md "undefined#/properties/stockTotal")

### stockTotal Type

`integer`

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ArticuloStockPorDepositoResponse](articulostockpordepositoresponse-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `true` |             |
