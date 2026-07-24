# ComisionesSettingsEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ComisionesSettingsEnvelope.schema.json](../schema-json/ComisionesSettingsEnvelope.schema.json "open original schema") |

## ComisionesSettingsEnvelope Type

`object` ([ComisionesSettingsEnvelope](comisionessettingsenvelope.md))

# ComisionesSettingsEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ComisionesSettingsEnvelope](comisionessettings.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ComisionesSettingsEnvelope](comisionessettingsenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ComisionesSettings](comisionessettings.md))

* cannot be null

* defined in: [ComisionesSettingsEnvelope](comisionessettings.md "undefined#/properties/data")

### data Type

`object` ([ComisionesSettings](comisionessettings.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ComisionesSettingsEnvelope](comisionessettingsenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `true` |             |
