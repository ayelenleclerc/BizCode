# TransferenciaDepositoCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TransferenciaDepositoCreateInput.schema.json](../schema-json/TransferenciaDepositoCreateInput.schema.json "open original schema") |

## TransferenciaDepositoCreateInput Type

`object` ([TransferenciaDepositoCreateInput](transferenciadepositocreateinput.md))

# TransferenciaDepositoCreateInput Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                                                                     |
| :---------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| [destinoId](#destinoid) | `integer` | Required | cannot be null | [TransferenciaDepositoCreateInput](transferenciadepositocreateinput-properties-destinoid.md "undefined#/properties/destinoId") |
| [items](#items)         | `array`   | Required | cannot be null | [TransferenciaDepositoCreateInput](transferenciadepositocreateinput-properties-items.md "undefined#/properties/items")         |
| [nota](#nota)           | `string`  | Optional | cannot be null | [TransferenciaDepositoCreateInput](transferenciadepositocreateinput-properties-nota.md "undefined#/properties/nota")           |
| [origenId](#origenid)   | `integer` | Required | cannot be null | [TransferenciaDepositoCreateInput](transferenciadepositocreateinput-properties-origenid.md "undefined#/properties/origenId")   |

## destinoId



`destinoId`

* is required

* Type: `integer`

* cannot be null

* defined in: [TransferenciaDepositoCreateInput](transferenciadepositocreateinput-properties-destinoid.md "undefined#/properties/destinoId")

### destinoId Type

`integer`

### destinoId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## items



`items`

* is required

* Type: `object[]` ([Details](transferenciadepositocreateinput-properties-items-items.md))

* cannot be null

* defined in: [TransferenciaDepositoCreateInput](transferenciadepositocreateinput-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([Details](transferenciadepositocreateinput-properties-items-items.md))

### items Constraints

**minimum number of items**: the minimum number of items for this array is: `1`

## nota



`nota`

* is optional

* Type: `string`

* cannot be null

* defined in: [TransferenciaDepositoCreateInput](transferenciadepositocreateinput-properties-nota.md "undefined#/properties/nota")

### nota Type

`string`

### nota Constraints

**maximum length**: the maximum number of characters for this string is: `200`

## origenId



`origenId`

* is required

* Type: `integer`

* cannot be null

* defined in: [TransferenciaDepositoCreateInput](transferenciadepositocreateinput-properties-origenid.md "undefined#/properties/origenId")

### origenId Type

`integer`

### origenId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
