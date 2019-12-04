export class FHIRUtils {
  static jsonToQueryString (json: object): string {
    return '?' + Object.keys(json).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(json[key])).join('&')
  }
  static flatten (tree: fhir.ElementTree[]): fhir.ElementTree[] {
    return tree.reduce((acc: any, r: any) => {
      acc.push(r);
      if (r.children && r.children.length) {
        acc = acc.concat(this.flatten(r.children));
      }
      return acc;
    }, [])
  }
}
