# PortalMagicLinkInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PortalMagicLinkInput.schema.json](../schema-json/PortalMagicLinkInput.schema.json "open original schema") |

## PortalMagicLinkInput Type

`object` ([PortalMagicLinkInput](portalmagiclinkinput.md))

# PortalMagicLinkInput Properties

| Property        | Type     | Required | Nullable       | Defined by                                                                                     |
| :-------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [email](#email) | `string` | Required | cannot be null | [PortalMagicLinkInput](portalmagiclinkinput-properties-email.md "undefined#/properties/email") |

## email



`email`

* is required

* Type: `string`

* cannot be null

* defined in: [PortalMagicLinkInput](portalmagiclinkinput-properties-email.md "undefined#/properties/email")

### email Type

`string`

### email Constraints

**email**: the string must be an email address, according to [RFC 5322, section 3.4.1](https://tools.ietf.org/html/rfc5322 "check the specification")
