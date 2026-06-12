# Untitled object in PortalFacturaListEnvelope Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PortalFacturaListEnvelope.schema.json\*](../schema-json/PortalFacturaListEnvelope.schema.json "open original schema") |

## data Type

`object` ([Details](portalfacturalistenvelope-properties-data.md))

# data Properties

| Property              | Type      | Required | Nullable       | Defined by                                                                                                                                     |
| :-------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| [facturas](#facturas) | `array`   | Required | cannot be null | [PortalFacturaListEnvelope](portalfacturalistenvelope-properties-data-properties-facturas.md "undefined#/properties/data/properties/facturas") |
| [total](#total)       | `integer` | Required | cannot be null | [PortalFacturaListEnvelope](portalfacturalistenvelope-properties-data-properties-total.md "undefined#/properties/data/properties/total")       |

## facturas



`facturas`

* is required

* Type: `object[]` ([PortalFacturaRow](portalfacturarow.md))

* cannot be null

* defined in: [PortalFacturaListEnvelope](portalfacturalistenvelope-properties-data-properties-facturas.md "undefined#/properties/data/properties/facturas")

### facturas Type

`object[]` ([PortalFacturaRow](portalfacturarow.md))

## total



`total`

* is required

* Type: `integer`

* cannot be null

* defined in: [PortalFacturaListEnvelope](portalfacturalistenvelope-properties-data-properties-total.md "undefined#/properties/data/properties/total")

### total Type

`integer`
