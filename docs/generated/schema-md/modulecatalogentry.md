# ModuleCatalogEntry Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ModuleCatalogEntry.schema.json](../schema-json/ModuleCatalogEntry.schema.json "open original schema") |

## ModuleCatalogEntry Type

`object` ([ModuleCatalogEntry](modulecatalogentry.md))

# ModuleCatalogEntry Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                   |
| :-------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [canDeactivate](#candeactivate)   | `boolean` | Required | cannot be null | [ModuleCatalogEntry](modulecatalogentry-properties-candeactivate.md "undefined#/properties/canDeactivate")   |
| [dependencies](#dependencies)     | `array`   | Required | cannot be null | [ModuleCatalogEntry](modulecatalogentry-properties-dependencies.md "undefined#/properties/dependencies")     |
| [key](#key)                       | `string`  | Required | cannot be null | [ModuleCatalogEntry](modulecatalogentry-properties-key.md "undefined#/properties/key")                       |
| [label](#label)                   | `string`  | Required | cannot be null | [ModuleCatalogEntry](modulecatalogentry-properties-label.md "undefined#/properties/label")                   |
| [plan](#plan)                     | `string`  | Required | cannot be null | [ModuleCatalogEntry](modulecatalogentry-properties-plan.md "undefined#/properties/plan")                     |
| [price](#price)                   | `number`  | Required | cannot be null | [ModuleCatalogEntry](modulecatalogentry-properties-price.md "undefined#/properties/price")                   |
| [required](#required)             | `boolean` | Required | cannot be null | [ModuleCatalogEntry](modulecatalogentry-properties-required.md "undefined#/properties/required")             |
| [requiredInProd](#requiredinprod) | `boolean` | Required | cannot be null | [ModuleCatalogEntry](modulecatalogentry-properties-requiredinprod.md "undefined#/properties/requiredInProd") |

## canDeactivate



`canDeactivate`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ModuleCatalogEntry](modulecatalogentry-properties-candeactivate.md "undefined#/properties/canDeactivate")

### canDeactivate Type

`boolean`

## dependencies



`dependencies`

* is required

* Type: `string[]`

* cannot be null

* defined in: [ModuleCatalogEntry](modulecatalogentry-properties-dependencies.md "undefined#/properties/dependencies")

### dependencies Type

`string[]`

## key



`key`

* is required

* Type: `string`

* cannot be null

* defined in: [ModuleCatalogEntry](modulecatalogentry-properties-key.md "undefined#/properties/key")

### key Type

`string`

## label



`label`

* is required

* Type: `string`

* cannot be null

* defined in: [ModuleCatalogEntry](modulecatalogentry-properties-label.md "undefined#/properties/label")

### label Type

`string`

## plan



`plan`

* is required

* Type: `string`

* cannot be null

* defined in: [ModuleCatalogEntry](modulecatalogentry-properties-plan.md "undefined#/properties/plan")

### plan Type

`string`

### plan Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"starter"`    |             |
| `"pro"`        |             |
| `"enterprise"` |             |

## price



`price`

* is required

* Type: `number`

* cannot be null

* defined in: [ModuleCatalogEntry](modulecatalogentry-properties-price.md "undefined#/properties/price")

### price Type

`number`

## required



`required`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ModuleCatalogEntry](modulecatalogentry-properties-required.md "undefined#/properties/required")

### required Type

`boolean`

## requiredInProd



`requiredInProd`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ModuleCatalogEntry](modulecatalogentry-properties-requiredinprod.md "undefined#/properties/requiredInProd")

### requiredInProd Type

`boolean`
