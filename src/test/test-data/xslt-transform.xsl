<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs" version="2.0">
    <xsl:template match="/">

        <div>
            
            <table>
                            
            <xsl:for-each select="/schedule/week">
                <xsl:sort select="weektext"/>
                <tr><td colspan="4"><xsl:value-of select="weektext"/></td></tr>
                <xsl:for-each select="events/event">
                    <xsl:sort select="events/event/start_date_time" type="datetime"/>
                      <tr>
                            <td>
                                <xsl:value-of select="FormattedDate"/>
                            </td>
                            <td>
                                <xsl:value-of select="event_title"/>
                            </td>
                            <td>
                                <xsl:value-of select="length"/> minutes 
                            </td>
                          <td>
                              <a href="Activity?EventID={event_id}">details...</a>
                          </td>
                        </tr>
                        <tr>
                            <td colspan="4">
                                <table>
                                    <xsl:for-each select="instances/instance">
                                        <tr>
                                            <td>
                                                <xsl:value-of select="start_date_time_formatted"/>
                                            </td>
                                            <td>
                                                <xsl:value-of select="end_date_time_formatted"/>
                                            </td>
                                            <td>
                                                <xsl:value-of select="room"/>
                                            </td>
                                            <td>
                                                <xsl:apply-templates select="instructors/instructor"
                                                />
                                            </td>
                                        </tr>
                                    </xsl:for-each>
                                </table>
                            </td>
                        
                        </tr>
                    
                </xsl:for-each>

            </xsl:for-each>

            </table>

        </div>
    </xsl:template>

    <xsl:template match="instructor">
        <xsl:text>, </xsl:text>
        <xsl:value-of select="."/>
    </xsl:template>

    <xsl:template match="instructor[1]">
        <xsl:value-of select="."/>
    </xsl:template>
    
</xsl:stylesheet>
