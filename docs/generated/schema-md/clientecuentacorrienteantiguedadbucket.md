# ClienteCuentaCorrienteAntiguedadBucket Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClienteCuentaCorrienteAntiguedadBucket.schema.json](../schema-json/ClienteCuentaCorrienteAntiguedadBucket.schema.json "open original schema") |

## ClienteCuentaCorrienteAntiguedadBucket Type

`object` ([ClienteCuentaCorrienteAntiguedadBucket](clientecuentacorrienteantiguedadbucket.md))

# ClienteCuentaCorrienteAntiguedadBucket Properties

| Property        | Type     | Required | Nullable       | Defined by                                                                                                                         |
| :-------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| [label](#label) | `string` | Required | cannot be null | [ClienteCuentaCorrienteAntiguedadBucket](clientecuentacorrienteantiguedadbucket-properties-label.md "undefined#/properties/label") |
| [total](#total) | `string` | Required | cannot be null | [ClienteCuentaCorrienteAntiguedadBucket](clientecuentacorrienteantiguedadbucket-properties-total.md "undefined#/properties/total") |

## label



`label`

* is required

* Type: `string`

* cannot be null

* defined in: [ClienteCuentaCorrienteAntiguedadBucket](clientecuentacorrienteantiguedadbucket-properties-label.md "undefined#/properties/label")

### label Type

`string`

### label Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value     | Explanation |
| :-------- | :---------- |
| `"0-30"`  |             |
| `"31-60"` |             |
| `"61-90"` |             |
| `"+90"`   |             |

## total



`total`

* is required

* Type: `string`

* cannot be null

* defined in: [ClienteCuentaCorrienteAntiguedadBucket](clientecuentacorrienteantiguedadbucket-properties-total.md "undefined#/properties/total")

### total Type

`string`
