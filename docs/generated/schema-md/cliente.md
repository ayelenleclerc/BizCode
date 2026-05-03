# Cliente Schema

```txt
undefined#/properties/data/anyOf/0
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClienteNullableEnvelope.schema.json\*](../schema-json/ClienteNullableEnvelope.schema.json "open original schema") |

## 0 Type

`object` ([Cliente](cliente.md))

# 0 Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                             |
| :-------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [activo](#activo)                 | `boolean` | Optional | cannot be null | [Cliente](cliente-properties-activo.md "undefined#/properties/activo")                 |
| [balance](#balance)               | `number`  | Optional | cannot be null | [Cliente](cliente-properties-balance.md "undefined#/properties/balance")               |
| [balanceInicial](#balanceinicial) | `number`  | Optional | cannot be null | [Cliente](cliente-properties-balanceinicial.md "undefined#/properties/balanceInicial") |
| [codigo](#codigo)                 | `integer` | Optional | cannot be null | [Cliente](cliente-properties-codigo.md "undefined#/properties/codigo")                 |
| [condIva](#condiva)               | `string`  | Optional | cannot be null | [Cliente](cliente-properties-condiva.md "undefined#/properties/condIva")               |
| [cpost](#cpost)                   | `string`  | Optional | cannot be null | [Cliente](cliente-properties-cpost.md "undefined#/properties/cpost")                   |
| [creditDays](#creditdays)         | `integer` | Optional | cannot be null | [Cliente](cliente-properties-creditdays.md "undefined#/properties/creditDays")         |
| [creditLimit](#creditlimit)       | `number`  | Optional | cannot be null | [Cliente](cliente-properties-creditlimit.md "undefined#/properties/creditLimit")       |
| [cuit](#cuit)                     | `string`  | Optional | cannot be null | [Cliente](cliente-properties-cuit.md "undefined#/properties/cuit")                     |
| [deliveryZoneId](#deliveryzoneid) | `integer` | Optional | cannot be null | [Cliente](cliente-properties-deliveryzoneid.md "undefined#/properties/deliveryZoneId") |
| [domicilio](#domicilio)           | `string`  | Optional | cannot be null | [Cliente](cliente-properties-domicilio.md "undefined#/properties/domicilio")           |
| [email](#email)                   | `string`  | Optional | cannot be null | [Cliente](cliente-properties-email.md "undefined#/properties/email")                   |
| [fantasia](#fantasia)             | `string`  | Optional | cannot be null | [Cliente](cliente-properties-fantasia.md "undefined#/properties/fantasia")             |
| [id](#id)                         | `integer` | Optional | cannot be null | [Cliente](cliente-properties-id.md "undefined#/properties/id")                         |
| [localidad](#localidad)           | `string`  | Optional | cannot be null | [Cliente](cliente-properties-localidad.md "undefined#/properties/localidad")           |
| [rsocial](#rsocial)               | `string`  | Optional | cannot be null | [Cliente](cliente-properties-rsocial.md "undefined#/properties/rsocial")               |
| [score](#score)                   | `integer` | Optional | cannot be null | [Cliente](cliente-properties-score.md "undefined#/properties/score")                   |
| [suspended](#suspended)           | `boolean` | Optional | cannot be null | [Cliente](cliente-properties-suspended.md "undefined#/properties/suspended")           |
| [telef](#telef)                   | `string`  | Optional | cannot be null | [Cliente](cliente-properties-telef.md "undefined#/properties/telef")                   |
| Additional Properties             | Any       | Optional | can be null    |                                                                                        |

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [Cliente](cliente-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## balance

Accumulated balance (incremented on each new factura).

`balance`

* is optional

* Type: `number`

* cannot be null

* defined in: [Cliente](cliente-properties-balance.md "undefined#/properties/balance")

### balance Type

`number`

### balance Default Value

The default value is:

```json
0
```

## balanceInicial

Opening balance at migration time.

`balanceInicial`

* is optional

* Type: `number`

* cannot be null

* defined in: [Cliente](cliente-properties-balanceinicial.md "undefined#/properties/balanceInicial")

### balanceInicial Type

`number`

### balanceInicial Default Value

The default value is:

```json
0
```

## codigo



`codigo`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Cliente](cliente-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`integer`

## condIva



`condIva`

* is optional

* Type: `string`

* cannot be null

* defined in: [Cliente](cliente-properties-condiva.md "undefined#/properties/condIva")

### condIva Type

`string`

## cpost



`cpost`

* is optional

* Type: `string`

* cannot be null

* defined in: [Cliente](cliente-properties-cpost.md "undefined#/properties/cpost")

### cpost Type

`string`

## creditDays

Usual credit days for this customer.

`creditDays`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Cliente](cliente-properties-creditdays.md "undefined#/properties/creditDays")

### creditDays Type

`integer`

### creditDays Default Value

The default value is:

```json
0
```

## creditLimit

Credit limit in ARS. null = no limit.

`creditLimit`

* is optional

* Type: `number`

* cannot be null

* defined in: [Cliente](cliente-properties-creditlimit.md "undefined#/properties/creditLimit")

### creditLimit Type

`number`

## cuit



`cuit`

* is optional

* Type: `string`

* cannot be null

* defined in: [Cliente](cliente-properties-cuit.md "undefined#/properties/cuit")

### cuit Type

`string`

## deliveryZoneId

FK to DeliveryZone. Assign a delivery zone to this customer.

`deliveryZoneId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Cliente](cliente-properties-deliveryzoneid.md "undefined#/properties/deliveryZoneId")

### deliveryZoneId Type

`integer`

## domicilio



`domicilio`

* is optional

* Type: `string`

* cannot be null

* defined in: [Cliente](cliente-properties-domicilio.md "undefined#/properties/domicilio")

### domicilio Type

`string`

## email



`email`

* is optional

* Type: `string`

* cannot be null

* defined in: [Cliente](cliente-properties-email.md "undefined#/properties/email")

### email Type

`string`

## fantasia



`fantasia`

* is optional

* Type: `string`

* cannot be null

* defined in: [Cliente](cliente-properties-fantasia.md "undefined#/properties/fantasia")

### fantasia Type

`string`

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Cliente](cliente-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## localidad



`localidad`

* is optional

* Type: `string`

* cannot be null

* defined in: [Cliente](cliente-properties-localidad.md "undefined#/properties/localidad")

### localidad Type

`string`

## rsocial



`rsocial`

* is optional

* Type: `string`

* cannot be null

* defined in: [Cliente](cliente-properties-rsocial.md "undefined#/properties/rsocial")

### rsocial Type

`string`

## score

Payment score 0-100 (50=neutral, 0=high risk, 100=perfect).

`score`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Cliente](cliente-properties-score.md "undefined#/properties/score")

### score Type

`integer`

### score Constraints

**maximum**: the value of this number must smaller than or equal to: `100`

**minimum**: the value of this number must greater than or equal to: `0`

### score Default Value

The default value is:

```json
50
```

## suspended

When true, POST /api/facturas returns 422 CLIENT\_SUSPENDED.

`suspended`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [Cliente](cliente-properties-suspended.md "undefined#/properties/suspended")

### suspended Type

`boolean`

### suspended Default Value

The default value is:

```json
false
```

## telef



`telef`

* is optional

* Type: `string`

* cannot be null

* defined in: [Cliente](cliente-properties-telef.md "undefined#/properties/telef")

### telef Type

`string`

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
