# CobroTransferInfoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CobroTransferInfoEnvelope.schema.json](../schema-json/CobroTransferInfoEnvelope.schema.json "open original schema") |

## CobroTransferInfoEnvelope Type

`object` ([CobroTransferInfoEnvelope](cobrotransferinfoenvelope.md))

# CobroTransferInfoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [CobroTransferInfoEnvelope](cobrotransferinfoenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [CobroTransferInfoEnvelope](cobrotransferinfoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](cobrotransferinfoenvelope-properties-data.md))

* cannot be null

* defined in: [CobroTransferInfoEnvelope](cobrotransferinfoenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](cobrotransferinfoenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [CobroTransferInfoEnvelope](cobrotransferinfoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
