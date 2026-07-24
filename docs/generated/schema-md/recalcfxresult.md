# RecalcFxResult Schema

```txt
undefined#/properties/recalc
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TipoCambioMutationEnvelope.schema.json\*](../schema-json/TipoCambioMutationEnvelope.schema.json "open original schema") |

## recalc Type

`object` ([RecalcFxResult](recalcfxresult.md))

# recalc Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                       |
| :---------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [moneda](#moneda)             | `string`  | Required | cannot be null | [RecalcFxResult](recalcfxresult-properties-moneda.md "undefined#/properties/moneda")             |
| [tipo](#tipo)                 | `string`  | Required | cannot be null | [RecalcFxResult](recalcfxresult-properties-tipo.md "undefined#/properties/tipo")                 |
| [updatedCount](#updatedcount) | `integer` | Required | cannot be null | [RecalcFxResult](recalcfxresult-properties-updatedcount.md "undefined#/properties/updatedCount") |
| [valor](#valor)               | `number`  | Required | cannot be null | [RecalcFxResult](recalcfxresult-properties-valor.md "undefined#/properties/valor")               |

## moneda



`moneda`

* is required

* Type: `string`

* cannot be null

* defined in: [RecalcFxResult](recalcfxresult-properties-moneda.md "undefined#/properties/moneda")

### moneda Type

`string`

### moneda Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value   | Explanation |
| :------ | :---------- |
| `"USD"` |             |
| `"EUR"` |             |

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [RecalcFxResult](recalcfxresult-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"oficial"` |             |
| `"mep"`     |             |
| `"ccl"`     |             |
| `"blue"`    |             |
| `"manual"`  |             |

## updatedCount



`updatedCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [RecalcFxResult](recalcfxresult-properties-updatedcount.md "undefined#/properties/updatedCount")

### updatedCount Type

`integer`

## valor



`valor`

* is required

* Type: `number`

* cannot be null

* defined in: [RecalcFxResult](recalcfxresult-properties-valor.md "undefined#/properties/valor")

### valor Type

`number`
