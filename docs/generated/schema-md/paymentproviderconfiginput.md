# PaymentProviderConfigInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PaymentProviderConfigInput.schema.json](../schema-json/PaymentProviderConfigInput.schema.json "open original schema") |

## PaymentProviderConfigInput Type

`object` ([PaymentProviderConfigInput](paymentproviderconfiginput.md))

# PaymentProviderConfigInput Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [accessToken](#accesstoken)     | `string`  | Optional | cannot be null | [PaymentProviderConfigInput](paymentproviderconfiginput-properties-accesstoken.md "undefined#/properties/accessToken")     |
| [activo](#activo)               | `boolean` | Optional | cannot be null | [PaymentProviderConfigInput](paymentproviderconfiginput-properties-activo.md "undefined#/properties/activo")               |
| [collectorId](#collectorid)     | `string`  | Optional | cannot be null | [PaymentProviderConfigInput](paymentproviderconfiginput-properties-collectorid.md "undefined#/properties/collectorId")     |
| [externalPosId](#externalposid) | `string`  | Optional | cannot be null | [PaymentProviderConfigInput](paymentproviderconfiginput-properties-externalposid.md "undefined#/properties/externalPosId") |
| [provider](#provider)           | `string`  | Required | cannot be null | [PaymentProviderConfigInput](paymentprovidercode.md "undefined#/properties/provider")                                      |
| [publicKey](#publickey)         | `string`  | Optional | cannot be null | [PaymentProviderConfigInput](paymentproviderconfiginput-properties-publickey.md "undefined#/properties/publicKey")         |
| [sandboxMode](#sandboxmode)     | `boolean` | Optional | cannot be null | [PaymentProviderConfigInput](paymentproviderconfiginput-properties-sandboxmode.md "undefined#/properties/sandboxMode")     |
| [staticQrData](#staticqrdata)   | `string`  | Optional | cannot be null | [PaymentProviderConfigInput](paymentproviderconfiginput-properties-staticqrdata.md "undefined#/properties/staticQrData")   |
| [webhookSecret](#webhooksecret) | `string`  | Optional | cannot be null | [PaymentProviderConfigInput](paymentproviderconfiginput-properties-webhooksecret.md "undefined#/properties/webhookSecret") |

## accessToken



`accessToken`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentProviderConfigInput](paymentproviderconfiginput-properties-accesstoken.md "undefined#/properties/accessToken")

### accessToken Type

`string`

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderConfigInput](paymentproviderconfiginput-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## collectorId



`collectorId`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentProviderConfigInput](paymentproviderconfiginput-properties-collectorid.md "undefined#/properties/collectorId")

### collectorId Type

`string`

## externalPosId



`externalPosId`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentProviderConfigInput](paymentproviderconfiginput-properties-externalposid.md "undefined#/properties/externalPosId")

### externalPosId Type

`string`

## provider



`provider`

* is required

* Type: `string` ([PaymentProviderCode](paymentprovidercode.md))

* cannot be null

* defined in: [PaymentProviderConfigInput](paymentprovidercode.md "undefined#/properties/provider")

### provider Type

`string` ([PaymentProviderCode](paymentprovidercode.md))

### provider Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"mercadopago"` |             |
| `"payway"`      |             |
| `"stripe"`      |             |

## publicKey



`publicKey`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentProviderConfigInput](paymentproviderconfiginput-properties-publickey.md "undefined#/properties/publicKey")

### publicKey Type

`string`

## sandboxMode



`sandboxMode`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderConfigInput](paymentproviderconfiginput-properties-sandboxmode.md "undefined#/properties/sandboxMode")

### sandboxMode Type

`boolean`

## staticQrData



`staticQrData`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentProviderConfigInput](paymentproviderconfiginput-properties-staticqrdata.md "undefined#/properties/staticQrData")

### staticQrData Type

`string`

## webhookSecret



`webhookSecret`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentProviderConfigInput](paymentproviderconfiginput-properties-webhooksecret.md "undefined#/properties/webhookSecret")

### webhookSecret Type

`string`
