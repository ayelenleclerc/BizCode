# FacturaVoidBalanceCliente Schema

```txt
undefined#/properties/updatedCliente
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaVoidResult.schema.json\*](../schema-json/FacturaVoidResult.schema.json "open original schema") |

## updatedCliente Type

`object` ([FacturaVoidBalanceCliente](facturavoidbalancecliente.md))

# updatedCliente Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                           |
| :-------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [balance](#balance)         | Merged    | Required | cannot be null | [FacturaVoidBalanceCliente](facturavoidbalancecliente-properties-balance.md "undefined#/properties/balance")         |
| [creditLimit](#creditlimit) | `number`  | Required | cannot be null | [FacturaVoidBalanceCliente](facturavoidbalancecliente-properties-creditlimit.md "undefined#/properties/creditLimit") |
| [id](#id)                   | `integer` | Required | cannot be null | [FacturaVoidBalanceCliente](facturavoidbalancecliente-properties-id.md "undefined#/properties/id")                   |
| [rsocial](#rsocial)         | `string`  | Required | cannot be null | [FacturaVoidBalanceCliente](facturavoidbalancecliente-properties-rsocial.md "undefined#/properties/rsocial")         |

## balance

Customer balance after decrement (Prisma Decimal may serialize as string in JSON)

`balance`

* is required

* Type: merged type ([Details](facturavoidbalancecliente-properties-balance.md))

* cannot be null

* defined in: [FacturaVoidBalanceCliente](facturavoidbalancecliente-properties-balance.md "undefined#/properties/balance")

### balance Type

merged type ([Details](facturavoidbalancecliente-properties-balance.md))

one (and only one) of

* [Untitled number in FacturaVoidBalanceCliente](facturavoidbalancecliente-properties-balance-oneof-0.md "check type definition")

* [Untitled string in FacturaVoidBalanceCliente](facturavoidbalancecliente-properties-balance-oneof-1.md "check type definition")

## creditLimit



`creditLimit`

* is required

* Type: `number`

* cannot be null

* defined in: [FacturaVoidBalanceCliente](facturavoidbalancecliente-properties-creditlimit.md "undefined#/properties/creditLimit")

### creditLimit Type

`number`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [FacturaVoidBalanceCliente](facturavoidbalancecliente-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## rsocial



`rsocial`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaVoidBalanceCliente](facturavoidbalancecliente-properties-rsocial.md "undefined#/properties/rsocial")

### rsocial Type

`string`
