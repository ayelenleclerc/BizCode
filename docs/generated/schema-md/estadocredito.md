# EstadoCredito Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [EstadoCreditoEnvelope.schema.json\*](../schema-json/EstadoCreditoEnvelope.schema.json "open original schema") |

## data Type

`object` ([EstadoCredito](estadocredito.md))

# data Properties

| Property                                  | Type      | Required | Nullable       | Defined by                                                                                                 |
| :---------------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [asOf](#asof)                             | `string`  | Required | cannot be null | [EstadoCredito](estadocredito-properties-asof.md "undefined#/properties/asOf")                             |
| [deudaTotal](#deudatotal)                 | `string`  | Required | cannot be null | [EstadoCredito](estadocredito-properties-deudatotal.md "undefined#/properties/deudaTotal")                 |
| [deudaVencida](#deudavencida)             | `string`  | Required | cannot be null | [EstadoCredito](estadocredito-properties-deudavencida.md "undefined#/properties/deudaVencida")             |
| [diasMoraMax](#diasmoramax)               | `integer` | Required | cannot be null | [EstadoCredito](estadocredito-properties-diasmoramax.md "undefined#/properties/diasMoraMax")               |
| [disponible](#disponible)                 | `string`  | Required | cannot be null | [EstadoCredito](estadocredito-properties-disponible.md "undefined#/properties/disponible")                 |
| [facturasPendientes](#facturaspendientes) | `array`   | Required | cannot be null | [EstadoCredito](estadocredito-properties-facturaspendientes.md "undefined#/properties/facturasPendientes") |
| [limiteCredito](#limitecredito)           | `string`  | Required | cannot be null | [EstadoCredito](estadocredito-properties-limitecredito.md "undefined#/properties/limiteCredito")           |
| [nivel](#nivel)                           | `string`  | Required | cannot be null | [EstadoCredito](sellercreditnivel.md "undefined#/properties/nivel")                                        |

## asOf



`asOf`

* is required

* Type: `string`

* cannot be null

* defined in: [EstadoCredito](estadocredito-properties-asof.md "undefined#/properties/asOf")

### asOf Type

`string`

### asOf Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## deudaTotal



`deudaTotal`

* is required

* Type: `string`

* cannot be null

* defined in: [EstadoCredito](estadocredito-properties-deudatotal.md "undefined#/properties/deudaTotal")

### deudaTotal Type

`string`

## deudaVencida



`deudaVencida`

* is required

* Type: `string`

* cannot be null

* defined in: [EstadoCredito](estadocredito-properties-deudavencida.md "undefined#/properties/deudaVencida")

### deudaVencida Type

`string`

## diasMoraMax



`diasMoraMax`

* is required

* Type: `integer`

* cannot be null

* defined in: [EstadoCredito](estadocredito-properties-diasmoramax.md "undefined#/properties/diasMoraMax")

### diasMoraMax Type

`integer`

### diasMoraMax Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## disponible



`disponible`

* is required

* Type: `string`

* cannot be null

* defined in: [EstadoCredito](estadocredito-properties-disponible.md "undefined#/properties/disponible")

### disponible Type

`string`

## facturasPendientes



`facturasPendientes`

* is required

* Type: `object[]` ([EstadoCreditoFacturaPendiente](estadocreditofacturapendiente.md))

* cannot be null

* defined in: [EstadoCredito](estadocredito-properties-facturaspendientes.md "undefined#/properties/facturasPendientes")

### facturasPendientes Type

`object[]` ([EstadoCreditoFacturaPendiente](estadocreditofacturapendiente.md))

## limiteCredito



`limiteCredito`

* is required

* Type: `string`

* cannot be null

* defined in: [EstadoCredito](estadocredito-properties-limitecredito.md "undefined#/properties/limiteCredito")

### limiteCredito Type

`string`

## nivel



`nivel`

* is required

* Type: `string` ([SellerCreditNivel](sellercreditnivel.md))

* cannot be null

* defined in: [EstadoCredito](sellercreditnivel.md "undefined#/properties/nivel")

### nivel Type

`string` ([SellerCreditNivel](sellercreditnivel.md))

### nivel Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"ok"`       |             |
| `"amarillo"` |             |
| `"naranja"`  |             |
| `"rojo"`     |             |
