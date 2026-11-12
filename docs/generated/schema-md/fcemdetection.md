# FcemDetection Schema

```txt
undefined#/properties/detection
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FcemStatus.schema.json\*](../schema-json/FcemStatus.schema.json "open original schema") |

## detection Type

`object` ([FcemDetection](fcemdetection.md))

# detection Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                         |
| :-------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [fcemTipoCbte](#fcemtipocbte)     | `integer` | Required | cannot be null | [FcemDetection](fcemdetection-properties-fcemtipocbte.md "undefined#/properties/fcemTipoCbte")     |
| [reasons](#reasons)               | `array`   | Required | cannot be null | [FcemDetection](fcemdetection-properties-reasons.md "undefined#/properties/reasons")               |
| [required](#required)             | `boolean` | Required | cannot be null | [FcemDetection](fcemdetection-properties-required.md "undefined#/properties/required")             |
| [umbralAplicado](#umbralaplicado) | `number`  | Required | cannot be null | [FcemDetection](fcemdetection-properties-umbralaplicado.md "undefined#/properties/umbralAplicado") |

## fcemTipoCbte



`fcemTipoCbte`

* is required

* Type: `integer`

* cannot be null

* defined in: [FcemDetection](fcemdetection-properties-fcemtipocbte.md "undefined#/properties/fcemTipoCbte")

### fcemTipoCbte Type

`integer`

## reasons



`reasons`

* is required

* Type: `string[]`

* cannot be null

* defined in: [FcemDetection](fcemdetection-properties-reasons.md "undefined#/properties/reasons")

### reasons Type

`string[]`

## required



`required`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FcemDetection](fcemdetection-properties-required.md "undefined#/properties/required")

### required Type

`boolean`

## umbralAplicado



`umbralAplicado`

* is required

* Type: `number`

* cannot be null

* defined in: [FcemDetection](fcemdetection-properties-umbralaplicado.md "undefined#/properties/umbralAplicado")

### umbralAplicado Type

`number`
